import { LinkedinAccountField } from 'src/front-components/components/LinkedinAccountField';
import { LinkedinContactAutoCreationSection } from 'src/front-components/components/LinkedinContactAutoCreationSection';
import { LinkedinImportSection } from 'src/front-components/components/LinkedinImportSection';
import { LinkedinPeopleMatchingSection } from 'src/front-components/components/LinkedinPeopleMatchingSection';
import { LinkedinReadStatusSection } from 'src/front-components/components/LinkedinReadStatusSection';
import { LinkedinVisibilitySection } from 'src/front-components/components/LinkedinVisibilitySection';
import { type LinkedinConnectedSettingsView } from 'src/types/linkedin-connected-settings-view.type';

type LinkedinSyncTabProps = {
  connection: LinkedinConnectedSettingsView['connection'];
  settings: LinkedinConnectedSettingsView['settings'];
  onSettingsChange: (
    update: Partial<LinkedinConnectedSettingsView['settings']>,
  ) => void;
};

export const LinkedinSyncTab = ({
  connection,
  settings,
  onSettingsChange,
}: LinkedinSyncTabProps) => (
  <>
    <LinkedinAccountField
      name={connection.name}
      handle={connection.handle}
      isAuthFailed={connection.isAuthFailed}
    />
    <LinkedinImportSection
      importPolicy={settings.importPolicy}
      selectedChats={settings.selectedChats}
      areGroupChatsImported={settings.areGroupChatsImported}
      onChange={(importPolicy) => onSettingsChange({ importPolicy })}
      onSelectedChatsChange={(selectedChats) =>
        onSettingsChange({ selectedChats })
      }
      onGroupChatsImportChange={(areGroupChatsImported) =>
        onSettingsChange({ areGroupChatsImported })
      }
    />
    <LinkedinVisibilitySection
      visibility={settings.visibility}
      onChange={(visibility) => onSettingsChange({ visibility })}
    />
    <LinkedinContactAutoCreationSection
      policy={settings.contactAutoCreationPolicy}
      onChange={(contactAutoCreationPolicy) =>
        onSettingsChange({ contactAutoCreationPolicy })
      }
    />
    <LinkedinPeopleMatchingSection
      isNameMatchingEnabled={settings.isNameMatchingEnabled}
      onChange={(isNameMatchingEnabled) =>
        onSettingsChange({ isNameMatchingEnabled })
      }
    />
    <LinkedinReadStatusSection
      areChatsMarkedAsRead={settings.areChatsMarkedAsRead}
      onChange={(areChatsMarkedAsRead) =>
        onSettingsChange({ areChatsMarkedAsRead })
      }
    />
  </>
);
