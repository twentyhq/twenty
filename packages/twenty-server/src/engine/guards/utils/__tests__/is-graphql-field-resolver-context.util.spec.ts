import { GqlExecutionContext } from '@nestjs/graphql';

import { buildExecutionContextMock } from 'test/utils/build-execution-context-mock.util';

import { isGraphqlFieldResolverContext } from 'src/engine/guards/utils/is-graphql-field-resolver-context.util';

const mockGraphqlInfo = (info: unknown) =>
  jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
    getInfo: () => info,
  } as unknown as GqlExecutionContext);

describe('isGraphqlFieldResolverContext', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should classify a root operation as not a field resolver', () => {
    mockGraphqlInfo({ path: { prev: undefined, key: 'currentUser' } });

    expect(
      isGraphqlFieldResolverContext(
        buildExecutionContextMock({ type: 'graphql' }),
      ),
    ).toBe(false);
  });

  it('should classify a field under a root operation as a field resolver', () => {
    mockGraphqlInfo({
      path: {
        prev: { prev: undefined, key: 'currentUser' },
        key: 'workspaceMembers',
      },
    });

    expect(
      isGraphqlFieldResolverContext(
        buildExecutionContextMock({ type: 'graphql' }),
      ),
    ).toBe(true);
  });

  it('should classify a field of a list item as a field resolver', () => {
    mockGraphqlInfo({
      path: {
        prev: { prev: { prev: undefined, key: 'objects' }, key: 0 },
        key: 'indexMetadataList',
      },
    });

    expect(
      isGraphqlFieldResolverContext(
        buildExecutionContextMock({ type: 'graphql' }),
      ),
    ).toBe(true);
  });

  it('should not classify an http request as a field resolver', () => {
    const createSpy = jest.spyOn(GqlExecutionContext, 'create');

    expect(
      isGraphqlFieldResolverContext(
        buildExecutionContextMock({ type: 'http' }),
      ),
    ).toBe(false);
    expect(createSpy).not.toHaveBeenCalled();
  });

  it('should not classify a graphql context without resolve info as a field resolver', () => {
    mockGraphqlInfo(undefined);

    expect(
      isGraphqlFieldResolverContext(
        buildExecutionContextMock({ type: 'graphql' }),
      ),
    ).toBe(false);
  });
});
