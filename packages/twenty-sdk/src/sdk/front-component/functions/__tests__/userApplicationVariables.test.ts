import { frontComponentHostCommunicationApi } from '../../globals/frontComponentHostCommunicationApi';
import { getUserApplicationVariables } from '../getUserApplicationVariables';
import { updateUserApplicationVariable } from '../updateUserApplicationVariable';

describe('personal app settings host access', () => {
  afterEach(() => {
    delete frontComponentHostCommunicationApi.getUserApplicationVariables;
    delete frontComponentHostCommunicationApi.updateUserApplicationVariable;
  });

  it('rejects reads and writes outside a personal settings host', async () => {
    await expect(getUserApplicationVariables()).rejects.toMatchObject({
      code: 'FRONT_COMPONENT_USER_PREFERENCES_UNAVAILABLE',
    });
    await expect(
      updateUserApplicationVariable({ key: 'TOKEN', value: 'new-value' }),
    ).rejects.toMatchObject({
      code: 'FRONT_COMPONENT_USER_PREFERENCES_UNAVAILABLE',
    });
  });

  it('uses the bound host and propagates its errors', async () => {
    const getVariables = vi.fn().mockResolvedValue({ TOKEN: '********' });
    const updateVariable = vi.fn().mockRejectedValue(new Error('Save failed'));

    frontComponentHostCommunicationApi.getUserApplicationVariables =
      getVariables;
    frontComponentHostCommunicationApi.updateUserApplicationVariable =
      updateVariable;

    await expect(getUserApplicationVariables()).resolves.toEqual({
      TOKEN: '********',
    });
    await expect(
      updateUserApplicationVariable({ key: 'TOKEN', value: 'new-value' }),
    ).rejects.toThrow('Save failed');
    expect(getVariables).toHaveBeenCalledWith();
    expect(updateVariable).toHaveBeenCalledWith({
      key: 'TOKEN',
      value: 'new-value',
    });
  });
});
