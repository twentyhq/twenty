import { PermissionsRestApiExceptionFilter } from 'src/engine/permissions/utils/permissions-rest-api-exception.filter';
import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { RestApiCoreController } from 'src/engine/api/rest/core/controllers/rest-api-core.controller';

describe('RestApiCoreController', () => {
  it('should define PermissionsRestApiExceptionFilter in exception filters chain', () => {
    const filters = Reflect.getMetadata(
      '__exceptionFilters__',
      RestApiCoreController,
    );

    expect(filters).toBeDefined();
    expect(filters).toContain(PermissionsRestApiExceptionFilter);
    expect(filters).toContain(RestApiExceptionFilter);
    expect(filters).toContain(AuthRestApiExceptionFilter);
  });
});
