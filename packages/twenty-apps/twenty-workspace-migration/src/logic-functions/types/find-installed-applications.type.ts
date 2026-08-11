export type FindInstalledApplicationsType = {
  data: {
    findManyApplications: {
      canBeUninstalled: boolean,
      universalIdentifier: string,
      name: string,
      applicationRegistration: { sourceType: string } | null,
      version: string
    }[]
  }
};