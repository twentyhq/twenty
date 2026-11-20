export type AdReferralSettings = {
  isOpportunityCreated: boolean;
};

export type GetAdReferralSettingsResult = AdReferralSettings & { canEdit: boolean };
