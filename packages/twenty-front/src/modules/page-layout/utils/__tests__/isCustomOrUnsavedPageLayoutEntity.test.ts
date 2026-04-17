import { isCustomOrUnsavedPageLayoutEntity } from '@/page-layout/utils/isCustomOrUnsavedPageLayoutEntity';

describe('isCustomOrUnsavedPageLayoutEntity', () => {
  const workspaceCustomApplicationId = 'custom-app-id';

  it('should return true when applicationId is undefined', () => {
    expect(
      isCustomOrUnsavedPageLayoutEntity({
        applicationId: undefined,
        workspaceCustomApplicationId,
      }),
    ).toBe(true);
  });

  it('should return true when applicationId is null', () => {
    expect(
      isCustomOrUnsavedPageLayoutEntity({
        applicationId: null,
        workspaceCustomApplicationId,
      }),
    ).toBe(true);
  });

  it('should return true when applicationId is an empty string', () => {
    expect(
      isCustomOrUnsavedPageLayoutEntity({
        applicationId: '',
        workspaceCustomApplicationId,
      }),
    ).toBe(true);
  });

  it('should return true when applicationId matches the workspace custom application id', () => {
    expect(
      isCustomOrUnsavedPageLayoutEntity({
        applicationId: workspaceCustomApplicationId,
        workspaceCustomApplicationId,
      }),
    ).toBe(true);
  });

  it('should return false when applicationId does not match the workspace custom application id', () => {
    expect(
      isCustomOrUnsavedPageLayoutEntity({
        applicationId: 'standard-app-id',
        workspaceCustomApplicationId,
      }),
    ).toBe(false);
  });

  it('should return false when applicationId is set but workspaceCustomApplicationId is undefined', () => {
    expect(
      isCustomOrUnsavedPageLayoutEntity({
        applicationId: 'standard-app-id',
        workspaceCustomApplicationId: undefined,
      }),
    ).toBe(false);
  });
});
