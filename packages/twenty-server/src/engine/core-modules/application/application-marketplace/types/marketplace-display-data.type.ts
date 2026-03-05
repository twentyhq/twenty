// Rich display data stored alongside ApplicationRegistration for marketplace
// rendering. This is denormalized from the catalog source so it can be displayed
// pre-install without resolving the package.
export type MarketplaceDisplayData = {
  icon?: string;
  version?: string;
  category?: string;
  logo?: string;
  screenshots?: string[];
  aboutDescription?: string;
  providers?: string[];
  objects?: MarketplaceDisplayObject[];
  fields?: MarketplaceDisplayField[];
  logicFunctions?: MarketplaceDisplayLogicFunction[];
  frontComponents?: MarketplaceDisplayFrontComponent[];
  defaultRole?: MarketplaceDisplayDefaultRole;
};

type MarketplaceDisplayObject = {
  universalIdentifier: string;
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description?: string;
  icon?: string;
  fields: MarketplaceDisplayField[];
};

type MarketplaceDisplayField = {
  name: string;
  type: string;
  label: string;
  description?: string;
  icon?: string;
  objectUniversalIdentifier: string;
  universalIdentifier: string;
};

type MarketplaceDisplayLogicFunction = {
  name: string;
  description?: string;
  timeoutSeconds?: number;
};

type MarketplaceDisplayFrontComponent = {
  name: string;
  description?: string;
};

type MarketplaceDisplayDefaultRole = {
  id: string;
  label: string;
  description?: string;
  canReadAllObjectRecords: boolean;
  canUpdateAllObjectRecords: boolean;
  canSoftDeleteAllObjectRecords: boolean;
  canDestroyAllObjectRecords: boolean;
  canUpdateAllSettings: boolean;
  canAccessAllTools: boolean;
  objectPermissions: Array<{
    objectUniversalIdentifier: string;
    canReadObjectRecords?: boolean;
    canUpdateObjectRecords?: boolean;
    canSoftDeleteObjectRecords?: boolean;
    canDestroyObjectRecords?: boolean;
  }>;
  fieldPermissions: Array<{
    objectUniversalIdentifier: string;
    fieldUniversalIdentifier: string;
    canReadFieldValue?: boolean;
    canUpdateFieldValue?: boolean;
  }>;
  permissionFlags: string[];
};
