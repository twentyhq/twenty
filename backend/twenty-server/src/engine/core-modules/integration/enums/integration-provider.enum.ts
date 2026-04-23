import { registerEnumType } from '@nestjs/graphql';

export enum IntegrationProvider {
  WHATSAPP = 'WHATSAPP',
  SLACK = 'SLACK',
  NOTION = 'NOTION',
  MERCADO_PAGO = 'MERCADO_PAGO',
  TWILIO = 'TWILIO',
  TELEGRAM = 'TELEGRAM',
  HUBSPOT = 'HUBSPOT',
  LINEAR = 'LINEAR',
  STRIPE = 'STRIPE',
}

registerEnumType(IntegrationProvider, {
  name: 'IntegrationProvider',
  description: 'Available integration providers',
});

export enum IntegrationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ERROR = 'ERROR',
  PENDING = 'PENDING',
}

registerEnumType(IntegrationStatus, {
  name: 'IntegrationStatus',
  description: 'Integration connection status',
});
