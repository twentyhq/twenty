import { findAvailableMcpServerName } from 'src/engine/core-modules/application/application-marketplace/marketplace-mcp-server-catalog/utils/find-available-mcp-server-name.util';

describe('findAvailableMcpServerName', () => {
  it('should keep the name when it is free', () => {
    expect(
      findAvailableMcpServerName({ name: 'linear', takenNames: ['notion'] }),
    ).toBe('linear');
  });

  it('should suffix the name when a server already uses it', () => {
    expect(
      findAvailableMcpServerName({
        name: 'linear',
        takenNames: ['linear', 'linear_2'],
      }),
    ).toBe('linear_3');
  });
});
