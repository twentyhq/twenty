import { DataSource } from 'typeorm';

import { buildApplicationIframeMediaPermissionGrantQuery } from 'src/engine/core-modules/application/utils/build-application-iframe-media-permission-grant-query.util';

describe('buildApplicationIframeMediaPermissionGrantQuery', () => {
  it('binds reviewed permissions as data without interpolating them into SQL', () => {
    const permission = {
      origin: "https://phone's.example.com",
      microphone: true,
      camera: false,
    };
    const grantQuery = buildApplicationIframeMediaPermissionGrantQuery([
      permission,
    ]);
    const dataSource = new DataSource({ type: 'postgres' });
    const [query, parameters] = dataSource.driver.escapeQueryWithParameters(
      grantQuery.query,
      grantQuery.parameters,
      {},
    );

    expect(query).toContain('$1::jsonb');
    expect(query).not.toContain(permission.origin);
    expect(parameters).toEqual([JSON.stringify([permission])]);
  });
});
