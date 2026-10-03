import { AppModule } from 'src/app.module';
import { collectEndpointPermissionDeclarations } from 'src/engine/guards/__tests__/collect-endpoint-permission-declarations.test-util';

jest.mock('@react-pdf/renderer', () => ({
  StyleSheet: { create: (styles: unknown) => styles },
}));

describe('endpoint permission declarations', () => {
  it('should match the AuthPrincipalGuard and application target of every mounted endpoint', async () => {
    expect(
      await collectEndpointPermissionDeclarations(AppModule),
    ).toMatchSnapshot();
  });
});
