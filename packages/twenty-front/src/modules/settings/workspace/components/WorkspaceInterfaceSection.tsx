import { useLingui } from '@lingui/react/macro';
import { Section } from 'twenty-ui/components/layout';
import { IconColorSwatch, IconTextSize } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';

import { SETTINGS_ROW_CONTROL_WIDTH } from '@/settings/constants/SettingsRowControlWidth';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { StyledSettingsSelectGroup } from '@/settings/components/SettingsOptions/StyledSettingsSelectGroup';
import { WorkspaceAccentColorSelect } from '@/settings/workspace/components/WorkspaceAccentColorSelect';
import { WorkspaceUiScaleSelect } from '@/settings/workspace/components/WorkspaceUiScaleSelect';

export const WorkspaceInterfaceSection = () => {
  const { t } = useLingui();

  return (
    <Section.Root>
      <Section.Header
        title={t`Interface`}
        description={t`Defaults for how the workspace looks to everyone in it`}
      />
      <StyledSettingsSelectGroup controlWidth={SETTINGS_ROW_CONTROL_WIDTH}>
        <Card.Root>
          <SettingsOptionCardContentSelect
            Icon={IconColorSwatch}
            title={t`Accent color`}
            description={t`Main actions, focus and selection`}
            divider
          >
            <WorkspaceAccentColorSelect />
          </SettingsOptionCardContentSelect>
          <SettingsOptionCardContentSelect
            Icon={IconTextSize}
            title={t`Scale`}
            description={t`Interface size for members who have not picked their own`}
          >
            <WorkspaceUiScaleSelect />
          </SettingsOptionCardContentSelect>
        </Card.Root>
      </StyledSettingsSelectGroup>
    </Section.Root>
  );
};
