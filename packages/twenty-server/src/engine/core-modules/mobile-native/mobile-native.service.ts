import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MobileSessionEntity, BiometricConfigEntity, OfflineQueueEntity, LocationCheckinEntity,
  SyncStatus, BiometricType, CheckinType,
} from './mobile-native.entity';

@Injectable()
export class MobileNativeService {
  private readonly logger = new Logger(MobileNativeService.name);

  constructor(
    @InjectRepository(MobileSessionEntity) private readonly sessionRepo: Repository<MobileSessionEntity>,
    @InjectRepository(BiometricConfigEntity) private readonly biometricRepo: Repository<BiometricConfigEntity>,
    @InjectRepository(OfflineQueueEntity) private readonly offlineRepo: Repository<OfflineQueueEntity>,
    @InjectRepository(LocationCheckinEntity) private readonly checkinRepo: Repository<LocationCheckinEntity>,
  ) {}

  async createSession(workspaceId: string, data: Partial<MobileSessionEntity>): Promise<MobileSessionEntity> {
    // Check for existing session on same device
    if (data.deviceId) {
      const existing = await this.sessionRepo.findOne({
        where: { workspaceId, userId: data.userId, deviceId: data.deviceId },
      });
      if (existing) {
        existing.isActive = true;
        existing.lastActiveAt = new Date();
        existing.sessionCount++;
        existing.appVersion = data.appVersion ?? existing.appVersion;
        existing.osVersion = data.osVersion ?? existing.osVersion;
        existing.pushToken = data.pushToken ?? existing.pushToken;
        return this.sessionRepo.save(existing);
      }
    }

    const session = this.sessionRepo.create({
      workspaceId,
      lastActiveAt: new Date(),
      sessionCount: 1,
      ...data,
    });

    this.logger.log(`Mobile session created: ${data.platform} ${data.appVersion} for user ${data.userId}`);
    return this.sessionRepo.save(session);
  }

  async validateBiometric(workspaceId: string, userId: string, deviceId: string): Promise<{
    valid: boolean; locked: boolean; remainingAttempts: number;
  }> {
    const config = await this.biometricRepo.findOne({
      where: { workspaceId, userId, deviceId },
    });

    if (!config) {
      return { valid: false, locked: false, remainingAttempts: 0 };
    }

    if (config.isLocked) {
      if (config.lockedUntil && new Date(config.lockedUntil) > new Date()) {
        return { valid: false, locked: true, remainingAttempts: 0 };
      }
      // Unlock if lock period has passed
      config.isLocked = false;
      config.failedAttempts = 0;
      await this.biometricRepo.save(config);
    }

    if (!config.isEnabled) {
      return { valid: false, locked: false, remainingAttempts: config.maxFailedAttempts };
    }

    // In a real implementation, this would verify the biometric signature
    // For now, we simulate a successful validation
    config.lastAuthAt = new Date();
    config.failedAttempts = 0;
    await this.biometricRepo.save(config);

    return {
      valid: true,
      locked: false,
      remainingAttempts: config.maxFailedAttempts,
    };
  }

  async queueOfflineAction(workspaceId: string, data: Partial<OfflineQueueEntity>): Promise<OfflineQueueEntity> {
    const action = this.offlineRepo.create({
      workspaceId,
      queuedAt: new Date(),
      syncStatus: SyncStatus.PENDING,
      ...data,
    });

    // Update session pending count
    if (data.userId) {
      const session = await this.sessionRepo.findOne({
        where: { workspaceId, userId: data.userId, isActive: true },
      });
      if (session) {
        session.offlineSyncsPending++;
        await this.sessionRepo.save(session);
      }
    }

    return this.offlineRepo.save(action);
  }

  async syncOfflineQueue(workspaceId: string, userId: string): Promise<{
    synced: number; failed: number; conflicts: number; remaining: number;
  }> {
    const pendingActions = await this.offlineRepo.find({
      where: { workspaceId, userId, syncStatus: SyncStatus.PENDING },
      order: { priority: 'DESC', queuedAt: 'ASC' },
    });

    let synced = 0;
    let failed = 0;
    let conflicts = 0;

    for (const action of pendingActions) {
      try {
        // In a real implementation, this would apply the action to the database
        // and handle conflict resolution
        action.syncStatus = SyncStatus.SYNCED;
        action.syncedAt = new Date();
        synced++;
      } catch (error) {
        action.retryCount++;
        if (action.retryCount >= action.maxRetries) {
          action.syncStatus = SyncStatus.FAILED;
          action.errorMessage = (error as Error).message;
          failed++;
        } else if ((error as Error).message.includes('conflict')) {
          action.syncStatus = SyncStatus.CONFLICT;
          conflicts++;
        }
      }
      await this.offlineRepo.save(action);
    }

    // Update session pending count
    const session = await this.sessionRepo.findOne({
      where: { workspaceId, userId, isActive: true },
    });
    if (session) {
      const remaining = await this.offlineRepo.count({
        where: { workspaceId, userId, syncStatus: SyncStatus.PENDING },
      });
      session.offlineSyncsPending = remaining;
      await this.sessionRepo.save(session);
    }

    const remainingCount = await this.offlineRepo.count({
      where: { workspaceId, userId, syncStatus: SyncStatus.PENDING },
    });

    this.logger.log(`Offline sync: ${synced} synced, ${failed} failed, ${conflicts} conflicts, ${remainingCount} remaining`);
    return { synced, failed, conflicts, remaining: remainingCount };
  }

  async recordCheckin(workspaceId: string, data: Partial<LocationCheckinEntity>): Promise<LocationCheckinEntity> {
    const checkin = this.checkinRepo.create({
      workspaceId,
      checkinAt: new Date(),
      ...data,
    });

    // Calculate distance from account location if available
    if (data.accountId && data.latitude && data.longitude) {
      // In a real implementation, we'd look up the account's location
      // and calculate the distance using haversine formula
      checkin.distanceFromAccountKm = 0;
    }

    // Update session last location
    if (data.userId) {
      const session = await this.sessionRepo.findOne({
        where: { workspaceId, userId: data.userId, isActive: true },
      });
      if (session) {
        session.lastLat = data.latitude ?? undefined as unknown as number;
        session.lastLng = data.longitude ?? undefined as unknown as number;
        session.lastActiveAt = new Date();
        await this.sessionRepo.save(session);
      }
    }

    return this.checkinRepo.save(checkin);
  }

  async getNearbyClients(workspaceId: string, latitude: number, longitude: number, radiusKm: number = 10): Promise<Array<{
    checkinId: string; accountId: string; distanceKm: number; lastVisitAt: Date;
  }>> {
    // Get recent checkins with account associations
    const checkins = await this.checkinRepo.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
      take: 500,
    });

    const accountCheckins: Record<string, LocationCheckinEntity> = {};
    for (const checkin of checkins) {
      if (checkin.accountId && !accountCheckins[checkin.accountId]) {
        accountCheckins[checkin.accountId] = checkin;
      }
    }

    const nearby: Array<{ checkinId: string; accountId: string; distanceKm: number; lastVisitAt: Date }> = [];

    for (const [accountId, checkin] of Object.entries(accountCheckins)) {
      if (checkin.latitude && checkin.longitude) {
        const distance = this.haversineKm(latitude, longitude, checkin.latitude, checkin.longitude);
        if (distance <= radiusKm) {
          nearby.push({
            checkinId: checkin.id,
            accountId,
            distanceKm: Math.round(distance * 10) / 10,
            lastVisitAt: checkin.checkinAt ?? checkin.createdAt,
          });
        }
      }
    }

    return nearby.sort((a, b) => a.distanceKm - b.distanceKm);
  }

  private haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
