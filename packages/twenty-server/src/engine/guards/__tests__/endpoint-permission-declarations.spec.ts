import { collectEndpointPermissionDeclarations } from 'src/engine/guards/__tests__/collect-endpoint-permission-declarations.test-util';

// A diff in this snapshot changes who can reach an endpoint: review it as a
// permission change, not as a snapshot refresh
describe('endpoint permission declarations', () => {
  it('should match every AuthPrincipalGuard and application target declaration', () => {
    expect(collectEndpointPermissionDeclarations()).toMatchSnapshot();
  });
});
