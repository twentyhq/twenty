import { isDefined } from 'twenty-sdk/utils';

import { WhatsappAccountField } from 'src/front-components/components/WhatsappAccountField';
import { WhatsappContactAutoCreationSection } from 'src/front-components/components/WhatsappContactAutoCreationSection';
import { WhatsappImportSection } from 'src/front-components/components/WhatsappImportSection';
import { WhatsappReadStatusSection } from 'src/front-components/components/WhatsappReadStatusSection';
import { WhatsappSettingsContainer } from 'src/front-components/components/WhatsappSettingsContainer';
import { WhatsappVisibilitySection } from 'src/front-components/components/WhatsappVisibilitySection';
import { useWhatsappSettingsView } from 'src/front-components/hooks/use-whatsapp-settings-view';

export const WhatsappSettings = () => {
  const { state, loadSettings, updateSettings } = useWhatsappSettingsView();

  const view =
    state.step === 'ready' && state.view.isConnected ? state.view : undefined;

  return (
    <WhatsappSettingsContainer state={state} onLoad={loadSettings}>
      {isDefined(view) && (
        <>
          <WhatsappAccountField
            name={view.connection.name}
            handle={view.connection.handle}
            isAuthFailed={view.connection.isAuthFailed}
          />
          <WhatsappImportSection
            importPolicy={view.settings.importPolicy}
            selectedChats={view.settings.selectedChats}
            areGroupChatsImported={view.settings.areGroupChatsImported}
            onChange={(importPolicy) => updateSettings({ importPolicy })}
            onSelectedChatsChange={(selectedChats) =>
              updateSettings({ selectedChats })
            }
            onGroupChatsImportChange={(areGroupChatsImported) =>
              updateSettings({ areGroupChatsImported })
            }
          />
          <WhatsappVisibilitySection
            visibility={view.settings.visibility}
            onChange={(visibility) => updateSettings({ visibility })}
          />
          <WhatsappContactAutoCreationSection
            policy={view.settings.contactAutoCreationPolicy}
            onChange={(contactAutoCreationPolicy) =>
              updateSettings({ contactAutoCreationPolicy })
            }
          />
          <WhatsappReadStatusSection
            areChatsMarkedAsRead={view.settings.areChatsMarkedAsRead}
            onChange={(areChatsMarkedAsRead) =>
              updateSettings({ areChatsMarkedAsRead })
            }
          />
        </>
      )}
    </WhatsappSettingsContainer>
  );
};
