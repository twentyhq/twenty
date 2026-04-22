import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MobileAppEntity, MobileDeviceEntity, MobileAppStatus, MobilePlatform } from './mobile-app.entity';

@Injectable()
export class MobileService {
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
    await this.appRepo.update({ id, workspaceId }, data);
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
      });
      return this.deviceRepo.findOneBy({ id: existing.id })!;
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
          await this.sendAPNS(device.pushNotificationToken, title, body, data);
        } else {
          await this.sendFCM(device.pushNotificationToken, title, body, data);
        }
        sent++;
      } catch {
        failed++;
      }
    }

    return { sent, failed };
  }

  private async sendAPNS(token: string, title: string, body: string, data?: Record<string, string>): Promise<void> {
    console.log(`Sending APNS to ${token}: ${title}`);
  }

  private async sendFCM(token: string, title: string, body: string, data?: Record<string, string>): Promise<void> {
    console.log(`Sending FCM to ${token}: ${title}`);
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
