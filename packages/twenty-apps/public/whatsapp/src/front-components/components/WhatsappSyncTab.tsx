import { WhatsappAccountField } from 'src/front-components/components/WhatsappAccountField';
import { WhatsappContactAutoCreationSection } from 'src/front-components/components/WhatsappContactAutoCreationSection';
import { WhatsappImportSection } from 'src/front-components/components/WhatsappImportSection';
import { WhatsappReadStatusSection } from 'src/front-components/components/WhatsappReadStatusSection';
import { WhatsappVisibilitySection } from 'src/front-components/components/WhatsappVisibilitySection';
import { type WhatsappConnectedSettingsView } from 'src/types/whatsapp-connected-settings-view.type';

type WhatsappSyncTabProps = {
  connection: WhatsappConnectedSettingsView['connection'];
  settings: WhatsappConnectedSettingsView['settings'];
  onSettingsChange: (
    update: Partial<WhatsappConnectedSettingsView['settings']>,
  ) => void;
};

export const WhatsappSyncTab = ({
  connection,
  settings,
  onSettingsChange,
}: WhatsappSyncTabProps) => (
  <>
    <WhatsappAccountField
      name={connection.name}
      handle={connection.handle}
      isAuthFailed={connection.isAuthFailed}
    />
    <WhatsappImportSection
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
    <WhatsappVisibilitySection
      visibility={settings.visibility}
      onChange={(visibility) => onSettingsChange({ visibility })}
    />
    <WhatsappContactAutoCreationSection
      policy={settings.contactAutoCreationPolicy}
      onChange={(contactAutoCreationPolicy) =>
        onSettingsChange({ contactAutoCreationPolicy })
      }
    />
    <WhatsappReadStatusSection
      areChatsMarkedAsRead={settings.areChatsMarkedAsRead}
      onChange={(areChatsMarkedAsRead) =>
        onSettingsChange({ areChatsMarkedAsRead })
      }
    />
  </>
);
