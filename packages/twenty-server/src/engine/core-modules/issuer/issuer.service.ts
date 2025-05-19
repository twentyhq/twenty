import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

import { Issuer } from './issuer.entity';

import { CreateIssuerInput } from './dtos/create-issuer.input';
import { UpdateIssuerInput } from './dtos/update-issuer.input';

@Injectable()
export class IssuerService {
  constructor(
    @InjectRepository(Issuer, 'core')
    private readonly issuerRepository: Repository<Issuer>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

  async create(createInput: CreateIssuerInput): Promise<Issuer> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: createInput.workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException(
        `Workspace with ID "${createInput.workspaceId}" not found`,
      );
    }

    const newIssuer = this.issuerRepository.create({
      ...createInput,
      workspace,
    });

    try {
      return await this.issuerRepository.save(newIssuer);
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException(
          'An issuer with this CNPJ already exists in this workspace.',
        );
      }
      throw error;
    }
  }

  async findAllByWorkspace(workspaceId: string): Promise<Issuer[]> {
    return this.issuerRepository.find({
      where: { workspace: { id: workspaceId } },
      relations: ['workspace'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Issuer> {
    const issuer = await this.issuerRepository.findOne({
      where: { id },
      relations: ['workspace'],
    });

    if (!issuer) {
      throw new NotFoundException(`Issuer with ID "${id}" not found`);
    }

    return issuer;
  }

  async update(id: string, updateInput: UpdateIssuerInput): Promise<Issuer> {
    const issuer = await this.issuerRepository.findOneBy({ id });

    if (!issuer) {
      throw new NotFoundException(`Issuer with ID "${id}" not found to update`);
    }

    const { id: _, workspaceId: __, ...updateData } = updateInput;

    Object.assign(issuer, updateData);

    try {
      return await this.issuerRepository.save(issuer);
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException(
          'An issuer with this CNPJ already exists in this workspace.',
        );
      }
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    const issuer = await this.findById(id);

    if (!issuer) {
      throw new NotFoundException(`Issuer with ID "${id}" not found to delete`);
    }

    const result = await this.issuerRepository.delete(id);

    return result.affected ? result.affected > 0 : false;
  }
}
