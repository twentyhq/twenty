import { ScalarsExplorerService } from 'src/engine/api/graphql/services/scalars-explorer.service';
import { ConnectionCursorScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

describe('ScalarsExplorerService', () => {
  it('registers the ConnectionCursor implementation used by rebuilt workspace schemas', () => {
    const scalar = new ScalarsExplorerService().getScalarImplementation(
      'ConnectionCursor',
    );

    expect(scalar).toBe(ConnectionCursorScalarType);
    expect(() => scalar?.parseValue(42)).toThrow(
      'ConnectionCursor must be a string',
    );
  });
});
