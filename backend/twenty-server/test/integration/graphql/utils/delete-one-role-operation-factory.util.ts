export const deleteOneRoleOperationFactory = (roleId: string) => ({
  query: `
    mutation DeleteOneRole {
        deleteOneRole(roleId: "${roleId}")
      }
    `,
});
