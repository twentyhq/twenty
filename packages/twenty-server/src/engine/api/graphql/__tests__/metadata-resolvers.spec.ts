import { metadataResolvers } from 'src/engine/api/graphql/metadata-resolvers';

describe('metadataResolvers', () => {
  it('should export a non-empty array of resolver classes', () => {
    expect(metadataResolvers).toBeDefined();
    expect(Array.isArray(metadataResolvers)).toBe(true);
    expect(metadataResolvers.length).toBeGreaterThan(0);
  });

  it('should contain only function (class) references', () => {
    for (const resolver of metadataResolvers) {
      expect(typeof resolver).toBe('function');
    }
  });

  it('should not contain duplicates', () => {
    const uniqueResolvers = new Set(metadataResolvers);

    expect(uniqueResolvers.size).toBe(metadataResolvers.length);
  });

  it('should contain all expected metadata resolver classes', () => {
    const resolverNames = metadataResolvers.map((r) => r.name);

    expect(resolverNames).toContain('AgentTurnResolver');
    expect(resolverNames).toContain('AgentResolver');
    expect(resolverNames).toContain('AgentChatResolver');
    expect(resolverNames).toContain('CommandMenuItemResolver');
    expect(resolverNames).toContain('FieldMetadataResolver');
    expect(resolverNames).toContain('FrontComponentResolver');
    expect(resolverNames).toContain('IndexMetadataResolver');
    expect(resolverNames).toContain('LogicFunctionLayerResolver');
    expect(resolverNames).toContain('LogicFunctionResolver');
    expect(resolverNames).toContain('NavigationMenuItemResolver');
    expect(resolverNames).toContain('ObjectMetadataResolver');
    expect(resolverNames).toContain('PageLayoutTabResolver');
    expect(resolverNames).toContain('PageLayoutWidgetResolver');
    expect(resolverNames).toContain('PageLayoutResolver');
    expect(resolverNames).toContain('RoleResolver');
    expect(resolverNames).toContain('SkillResolver');
    expect(resolverNames).toContain('ViewFieldResolver');
    expect(resolverNames).toContain('ViewFilterGroupResolver');
    expect(resolverNames).toContain('ViewFilterResolver');
    expect(resolverNames).toContain('ViewGroupResolver');
    expect(resolverNames).toContain('ViewSortResolver');
    expect(resolverNames).toContain('ViewResolver');
    expect(resolverNames).toContain('WebhookResolver');
  });

  it('should not contain any core resolvers', () => {
    const resolverNames = metadataResolvers.map((r) => r.name);

    // These are core resolvers that should NOT be in the metadata list
    expect(resolverNames).not.toContain('AuthResolver');
    expect(resolverNames).not.toContain('UserResolver');
    expect(resolverNames).not.toContain('WorkspaceResolver');
    expect(resolverNames).not.toContain('BillingResolver');
    expect(resolverNames).not.toContain('AdminPanelResolver');
    expect(resolverNames).not.toContain('FileUploadResolver');
    expect(resolverNames).not.toContain('SearchResolver');
    expect(resolverNames).not.toContain('ClientConfigResolver');
  });
});
