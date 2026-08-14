export type FindWorkspaceMembersType = {
  data: {
    workspaceMembers: {
      edges: {
        node: WorkspaceMember
      }[]
    }
  }
}

export type WorkspaceMember = {
  id: string,
  userEmail: string,
}