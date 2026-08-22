export type CurrentWorkspaceMetadataType = {
  data: {
    currentWorkspace: {
      billingSubscriptions: [
        {
          metadata: {
            plan: "ENTERPRISE" | "PRO",
            workspaceId: string
          }
        }
      ] | []
    }
  }
}