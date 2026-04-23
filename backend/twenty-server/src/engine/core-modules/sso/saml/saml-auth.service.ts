import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SamlIdentityProviderEntity, SsoIdentityProviderType } from './saml-auth.entity';

@Injectable()
export class SamlAuthService implements OnModuleInit {
  constructor(
    @InjectRepository(SamlIdentityProviderEntity)
    private readonly samlRepo: Repository<SamlIdentityProviderEntity>,
  ) {}

  async onModuleInit() {
    await this.samlRepo.find({ relations: ['workspace'] });
  }

  async createSamlProvider(
    workspaceId: string,
    data: Partial<SamlIdentityProviderEntity>,
  ): Promise<SamlIdentityProviderEntity> {
    const provider = this.samlRepo.create({
      ...data,
      workspaceId,
    });
    return this.samlRepo.save(provider);
  }

  async findByWorkspace(workspaceId: string): Promise<SamlIdentityProviderEntity[]> {
    return this.samlRepo.find({
      where: { workspaceId, isActive: true },
      order: { isDefault: 'DESC', createdAt: 'ASC' },
    });
  }

  async findDefault(workspaceId: string): Promise<SamlIdentityProviderEntity | null> {
    return this.samlRepo.findOne({
      where: { workspaceId, isActive: true, isDefault: true },
    });
  }

  async updateProvider(
    id: string,
    data: Partial<SamlIdentityProviderEntity>,
  ): Promise<SamlIdentityProviderEntity> {
    await this.samlRepo.update(id, data as never);
    const provider = await this.samlRepo.findOneBy({ id });
    if (!provider) {
      throw new Error(`SAML provider ${id} not found`);
    }
    return provider;
  }

  async setDefault(workspaceId: string, providerId: string): Promise<void> {
    await this.samlRepo.update(
      { workspaceId },
      { isDefault: false },
    );
    await this.samlRepo.update(
      { id: providerId, workspaceId },
      { isDefault: true },
    );
  }

  async deleteProvider(id: string, workspaceId: string): Promise<void> {
    await this.samlRepo.delete({ id, workspaceId });
  }

  getMetadataXml(provider: SamlIdentityProviderEntity): string {
    const metadata = `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor entityID="${provider.issuer}" xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata">
  <md:IDPSSODescriptor WantAuthnRequestsSigned="false" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:KeyDescriptor use="encryption">
      <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
        <ds:X509Data>
          <ds:X509Certificate>${provider.certificate}</ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
    </md:KeyDescriptor>
    <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="${provider.entryPointUrl}"/>
  </md:IDPSSODescriptor>
</md:EntityDescriptor>`;
    return metadata;
  }
}
