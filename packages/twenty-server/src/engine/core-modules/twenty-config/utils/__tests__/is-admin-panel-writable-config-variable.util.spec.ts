import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { isAdminPanelWritableConfigVariable } from 'src/engine/core-modules/twenty-config/utils/is-admin-panel-writable-config-variable.util';

describe('isAdminPanelWritableConfigVariable', () => {
  it('should allow LLM group variables', () => {
    expect(isAdminPanelWritableConfigVariable('OPENAI_API_KEY')).toBe(true);
    expect(isAdminPanelWritableConfigVariable('ANTHROPIC_API_KEY')).toBe(true);
    expect(isAdminPanelWritableConfigVariable('AI_PROVIDERS')).toBe(true);
  });

  it('should block non-LLM group variables', () => {
    expect(
      isAdminPanelWritableConfigVariable(
        'SERVER_URL' as keyof ConfigVariables,
      ),
    ).toBe(false);
    expect(
      isAdminPanelWritableConfigVariable(
        'IS_MULTIWORKSPACE_ENABLED' as keyof ConfigVariables,
      ),
    ).toBe(false);
  });
});
