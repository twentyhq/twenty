export type CustomAiProviderAccess = {
  hasAccess: boolean;
  seatCount: number;
  seatThreshold: number;
};

export type GetCustomAiProviderAccessResult = {
  getCustomAiProviderAccess: CustomAiProviderAccess;
};
