import { AppModule } from 'src/app.module';
import { collectEndpointPermissionDeclarations } from 'src/engine/guards/__tests__/collect-endpoint-permission-declarations.test-util';

// ESM-only, and only used to render a PDF, which the scan never does
jest.mock('@react-pdf/renderer', () => ({
  StyleSheet: { create: (styles: unknown) => styles },
}));

// A diff in this snapshot changes who can reach an endpoint: review it as a
// permission change, not as a snapshot refresh
describe('endpoint permission declarations', () => {
  it('should match the AuthPrincipalGuard and application target of every mounted endpoint', async () => {
    expect(
      await collectEndpointPermissionDeclarations(AppModule),
    ).toMatchSnapshot();
  });
});
