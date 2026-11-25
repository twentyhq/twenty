import { isDefined } from 'twenty-sdk/utils';

import { LinkedinAccountField } from 'src/front-components/components/LinkedinAccountField';
import { LinkedinContactAutoCreationSection } from 'src/front-components/components/LinkedinContactAutoCreationSection';
import { LinkedinImportSection } from 'src/front-components/components/LinkedinImportSection';
import { LinkedinPeopleMatchingSection } from 'src/front-components/components/LinkedinPeopleMatchingSection';
import { LinkedinReadStatusSection } from 'src/front-components/components/LinkedinReadStatusSection';
import { LinkedinSettingsContainer } from 'src/front-components/components/LinkedinSettingsContainer';
import { LinkedinVisibilitySection } from 'src/front-components/components/LinkedinVisibilitySection';
import { useLinkedinSettingsView } from 'src/front-components/hooks/use-linkedin-settings-view';

export const LinkedinSettings = () => {
  const { state, loadSettings, updateSettings } = useLinkedinSettingsView();

  const view =
    state.step === 'ready' && state.view.isConnected ? state.view : undefined;

  return (
    <LinkedinSettingsContainer state={state} onLoad={loadSettings}>
      {isDefined(view) && (
        <>
          <LinkedinAccountField
            name={view.connection.name}
            handle={view.connection.handle}
            isAuthFailed={view.connection.isAuthFailed}
          />
          <LinkedinImportSection
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
          <LinkedinVisibilitySection
            visibility={view.settings.visibility}
            onChange={(visibility) => updateSettings({ visibility })}
          />
          <LinkedinContactAutoCreationSection
            policy={view.settings.contactAutoCreationPolicy}
            onChange={(contactAutoCreationPolicy) =>
              updateSettings({ contactAutoCreationPolicy })
            }
          />
          <LinkedinPeopleMatchingSection
            isNameMatchingEnabled={view.settings.isNameMatchingEnabled}
            onChange={(isNameMatchingEnabled) =>
              updateSettings({ isNameMatchingEnabled })
            }
          />
          <LinkedinReadStatusSection
            areChatsMarkedAsRead={view.settings.areChatsMarkedAsRead}
            onChange={(areChatsMarkedAsRead) =>
              updateSettings({ areChatsMarkedAsRead })
            }
          />
        </>
      )}
    </LinkedinSettingsContainer>
  );
};
