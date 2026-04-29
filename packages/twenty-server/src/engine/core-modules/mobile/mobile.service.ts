import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MobileAppEntity, MobileDeviceEntity, MobileAppStatus, MobilePlatform } from './mobile-app.entity';

@Injectable()
export class MobileService {
  private readonly logger = new Logger(MobileService.name);
  constructor(
    @InjectRepository(MobileAppEntity)
    private readonly appRepo: Repository<MobileAppEntity>,
    @InjectRepository(MobileDeviceEntity)
    private readonly deviceRepo: Repository<MobileDeviceEntity>,
  ) {}

  // Mobile App Management
  async registerApp(
    workspaceId: string,
    data: Partial<MobileAppEntity>,
  ): Promise<MobileAppEntity> {
    const app = this.appRepo.create({ ...data, workspaceId });
    return this.appRepo.save(app);
  }

  async getApps(workspaceId: string): Promise<MobileAppEntity[]> {
    return this.appRepo.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateApp(
    id: string,
    workspaceId: string,
    data: Partial<MobileAppEntity>,
  ): Promise<MobileAppEntity> {
    await this.appRepo.update({ id, workspaceId }, data as any);
    const app = await this.appRepo.findOneBy({ id });
    if (!app) throw new NotFoundException(`App ${id} not found`);
    return app;
  }

  async suspendApp(id: string, workspaceId: string): Promise<void> {
    await this.appRepo.update(
      { id, workspaceId },
      { status: MobileAppStatus.SUSPENDED },
    );
  }

  // Device Registration
  async registerDevice(
    workspaceId: string,
    userId: string,
    data: Partial<MobileDeviceEntity>,
  ): Promise<MobileDeviceEntity> {
    const existing = await this.deviceRepo.findOne({
      where: { deviceToken: data.deviceToken, workspaceId, userId },
    });

    if (existing) {
      await this.deviceRepo.update(existing.id, {
        ...data,
        lastActiveAt: new Date(),
      } as any);
      const updated = await this.deviceRepo.findOneBy({ id: existing.id });
      if (!updated) throw new NotFoundException(`Device ${existing.id} not found`);
      return updated;
    }

    const device = this.deviceRepo.create({
      ...data,
      workspaceId,
      userId,
    });

    return this.deviceRepo.save(device);
  }

  async getUserDevices(userId: string, workspaceId: string): Promise<MobileDeviceEntity[]> {
    return this.deviceRepo.find({
      where: { userId, workspaceId },
      order: { lastActiveAt: 'DESC' },
    });
  }

  async revokeDevice(deviceId: string, workspaceId: string): Promise<void> {
    await this.deviceRepo.delete({ id: deviceId, workspaceId });
  }

  async updateDeviceActivity(deviceId: string): Promise<void> {
    await this.deviceRepo.update({ id: deviceId }, { lastActiveAt: new Date() });
  }

  async sendPushNotification(
    workspaceId: string,
    userId: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<{ sent: number; failed: number }> {
    const devices = await this.getUserDevices(userId, workspaceId);
    
    let sent = 0;
    let failed = 0;

    for (const device of devices) {
      try {
        if (device.platform === MobilePlatform.IOS) {
          await this.sendAPNS(device.deviceToken, title, body, data);
        } else {
          await this.sendFCM(device.deviceToken, title, body, data);
        }
        sent++;
      } catch {
        failed++;
      }
    }

    return { sent, failed };
  }

  private async sendAPNS(token: string, title: string, body: string, data?: Record<string, string>): Promise<void> {
    // APNS HTTP/2 API - requires APNS auth key configured in env
    const apnsHost = process.env.APNS_HOST ?? 'https://api.push.apple.com';
    const bundleId = process.env.APNS_BUNDLE_ID;
    const authKey = process.env.APNS_AUTH_KEY;
    if (!bundleId || !authKey) {
      this.logger.warn('APNS not configured (APNS_BUNDLE_ID, APNS_AUTH_KEY)');
      return;
    }
    const payload = JSON.stringify({ aps: { alert: { title, body }, sound: 'default' }, ...data });
    const response = await fetch(`${apnsHost}/3/device/${token}`, {
      method: 'POST',
      headers: { 'apns-topic': bundleId, 'apns-push-type': 'alert', authorization: `bearer ${authKey}`, 'content-type': 'application/json' },
      body: payload,
    });
    if (!response.ok) this.logger.error(`APNS failed for ${token}: ${response.status}`);
  }

  private async sendFCM(token: string, title: string, body: string, data?: Record<string, string>): Promise<void> {
    // FCM HTTP v1 API
    const fcmKey = process.env.FCM_SERVER_KEY;
    if (!fcmKey) {
      this.logger.warn('FCM not configured (FCM_SERVER_KEY)');
      return;
    }
    const payload = JSON.stringify({ to: token, notification: { title, body }, data: data ?? {} });
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: { Authorization: `key=${fcmKey}`, 'Content-Type': 'application/json' },
      body: payload,
    });
    if (!response.ok) this.logger.error(`FCM failed for ${token}: ${response.status}`);
  }

  // Offline sync endpoints
  async getPendingSync(userId: string, workspaceId: string, since?: Date): Promise<MobileDeviceEntity[]> {
    return this.deviceRepo.find({
      where: { 
        userId, 
        workspaceId,
        lastActiveAt: since ? require('typeorm').MoreThan(since) : undefined,
      },
    });
  }

  async recordSync(deviceId: string): Promise<void> {
    await this.deviceRepo.update({ id: deviceId }, { lastActiveAt: new Date() });
  }
}
