import { useState } from 'react';
import { t } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Info, Section } from 'twenty-ui/components';

import { GranolaFolderPicker } from 'src/front-components/components/GranolaFolderPicker';
import { GranolaFolderPolicyRadioCard } from 'src/front-components/components/GranolaFolderPolicyRadioCard';
import { OnMountEffect } from 'src/front-components/components/OnMountEffect';
import { StyledSettingsSectionStack } from 'src/front-components/components/StyledSettingsSectionStack';
import { type GranolaStoredFolderSelection } from 'src/front-components/types/granola-stored-folder-selection.type';
import { fetchGranolaFolderSelectionOrThrow } from 'src/front-components/utils/fetch-granola-folder-selection-or-throw.util';

type GranolaStoredSelectionState =
  | { step: 'LOADING' }
  | { step: 'FAILED' }
  | { step: 'LOADED'; storedSelection: GranolaStoredFolderSelection };

export const GranolaFolderSection = () => {
  const [storedSelectionState, setStoredSelectionState] =
    useState<GranolaStoredSelectionState>({ step: 'LOADING' });

  const loadStoredSelection = async () => {
    setStoredSelectionState({ step: 'LOADING' });

    const storedSelection = await fetchGranolaFolderSelectionOrThrow().catch(
      () => undefined,
    );

    setStoredSelectionState(
      isDefined(storedSelection)
        ? { step: 'LOADED', storedSelection }
        : { step: 'FAILED' },
    );
  };

  return (
    <Section.Root>
      <OnMountEffect onMount={loadStoredSelection} />
      <Section.Header
        title={t('Folders')}
        description={t(
          'Choose which Granola folders feed live sync and history imports.',
        )}
      />
      <StyledSettingsSectionStack>
        {storedSelectionState.step === 'LOADING' && (
          <GranolaFolderPolicyRadioCard policy={undefined} />
        )}
        {storedSelectionState.step === 'LOADED' && (
          <GranolaFolderPicker {...storedSelectionState.storedSelection} />
        )}
        {storedSelectionState.step === 'FAILED' && (
          <Info
            accent="danger"
            text={t('Could not load your Granola folders.')}
            buttonTitle={t('Retry')}
            onClick={loadStoredSelection}
          />
        )}
      </StyledSettingsSectionStack>
    </Section.Root>
  );
};
