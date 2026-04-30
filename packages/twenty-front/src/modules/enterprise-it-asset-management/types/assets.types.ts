export type AssetStatus = 'active' | 'maintenance' | 'retired' | 'disposed';

export type AssetData = {
  id: string;
  name: string;
  type: string;
  serialNumber: string;
  assignee: string;
  status: AssetStatus;
  purchaseDate: string;
  warrantyExpiry: string;
  value: number;
};

export type LicensePoolData = {
  id: string;
  softwareName: string;
  vendor: string;
  totalLicenses: number;
  usedLicenses: number;
  expirationDate: string;
  costPerLicense: number;
};

export type MaintenanceEventData = {
  id: string;
  assetName: string;
  type: 'preventive' | 'corrective' | 'upgrade';
  scheduledDate: string;
  assignee: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  estimatedDowntime: string;
};
