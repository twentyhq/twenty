import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateFocusNfeIntegrationInput } from 'src/engine/core-modules/focus-nfe/dtos/create-focus-nfe-integration.input';
import { UpdateFocusNfeIntegrationInput } from 'src/engine/core-modules/focus-nfe/dtos/update-focus-nfe-integration.input';
import { FocusNfeIntegration } from 'src/engine/core-modules/focus-nfe/focus-nfe-integration.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

import CryptoJS from 'crypto-js';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export class FocusNfeService {
  constructor(
    @InjectRepository(FocusNfeIntegration, 'core')
    private readonly focusNfeRepository: Repository<FocusNfeIntegration>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly environmentService: TwentyConfigService,
  ) {}

  async encryptText(text: string): Promise<string> {
    const secretKey = this.environmentService.get('FOCUS_NFE_ENCRYPTION_KEY');

    if (!secretKey) return text;
    const key = CryptoJS.enc.Utf8.parse(secretKey);
    const iv = CryptoJS.enc.Utf8.parse(secretKey.slice(0, 16));

    const encrypted = CryptoJS.AES.encrypt(text, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return encrypted.toString();
  }

  async decryptText(cipherText: string): Promise<string> {
    const secretKey = this.environmentService.get('FOCUS_NFE_ENCRYPTION_KEY');
    if (!secretKey) return cipherText;
    const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);

    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    return decrypted;
  }

  async create(
    createInput: CreateFocusNfeIntegrationInput,
  ): Promise<FocusNfeIntegration> {
    const workspace = await this.workspaceRepository.findOne({
      where: {
        id: createInput.workspaceId,
      },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const createdFocusNfeIntegration = this.focusNfeRepository.create({
      ...createInput,
      token: await this.encryptText(createInput.token),
      workspace,
    });

    return await this.focusNfeRepository.save(createdFocusNfeIntegration);
  }

  async findAll(workspaceId: string): Promise<FocusNfeIntegration[]> {
    return await this.focusNfeRepository.find({
      where: { workspace: { id: workspaceId } },
      relations: ['workspace'],
      order: {
        createdAt: 'DESC',
      },
      select: {
        id: true,
        integrationName: true,
        workspace: {
          id: true,
        },
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(
    focusNfeIntegrationId: string,
  ): Promise<FocusNfeIntegration | null> {
    return await this.focusNfeRepository.findOne({
      where: { id: focusNfeIntegrationId },
      relations: ['workspace'],
    });
  }

  async update(
    updateInput: UpdateFocusNfeIntegrationInput,
  ): Promise<FocusNfeIntegration> {
    const focusNfeIntegration = await this.focusNfeRepository.findOne({
      where: { id: updateInput.id },
      relations: ['workspace'],
    });

    if (!focusNfeIntegration) {
      throw new Error('Focus NFe integration not found');
    }

    if (updateInput.token) {
      updateInput.token = await this.encryptText(updateInput.token);
    }
    const updatedFocusNfeIntegration = {
      ...focusNfeIntegration,
      ...updateInput,
    };

    return await this.focusNfeRepository.save(updatedFocusNfeIntegration);
  }

  async delete(focusNfeIntegrationId: string): Promise<boolean> {
    const focusNfeIntegration = await this.focusNfeRepository.findOne({
      where: { id: focusNfeIntegrationId },
    });

    if (focusNfeIntegration) {
      const { affected } = await this.focusNfeRepository.delete(
        focusNfeIntegrationId,
      );

      if (!affected) {
        throw new BadRequestException(undefined, {
          description: 'Error when removing Focus NFe Integration',
        });
      }

      return affected ? true : false;
    }

    throw new BadRequestException(undefined, {
      description: 'Focus NFe integration not found',
    });
  }

  async toggleStatus(id: string): Promise<void> {
    const integration = await this.findById(id);

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    if (integration.status === 'active') {
      integration.status = 'inactive';
    } else {
      integration.status = 'active';
    }

    await this.focusNfeRepository.save(integration);
  }
}
