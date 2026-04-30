export type RegionCode = 'us_east' | 'us_west' | 'eu_west' | 'eu_central' | 'apac' | 'latam';

export type ComplianceFramework = 'gdpr' | 'hipaa' | 'soc2' | 'ccpa' | 'lgpd';

export type RegionData = {
  id: string;
  code: RegionCode;
  name: string;
  provider: string;
  complianceFrameworks: ComplianceFramework[];
  isAvailable: boolean;
};

export type MigrationData = {
  id: string;
  sourceRegion: RegionCode;
  targetRegion: RegionCode;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  startedAt: string;
  estimatedCompletion: string;
  dataSize: string;
};

export type DataLocationData = {
  id: string;
  dataType: string;
  region: RegionCode;
  recordCount: number;
  sizeGb: number;
  lastSyncedAt: string;
};
