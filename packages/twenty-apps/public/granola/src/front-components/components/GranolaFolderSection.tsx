import { useState } from 'react';
import { t } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Info } from 'twenty-ui/feedback';
import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/typography';

import { GranolaFolderPicker } from 'src/front-components/components/GranolaFolderPicker';
import { GranolaFolderPolicySkeleton } from 'src/front-components/components/GranolaFolderPolicySkeleton';
import { OnMountEffect } from 'src/front-components/components/OnMountEffect';
import { StyledSettingsSectionStack } from 'src/front-components/components/StyledSettingsSectionStack';
import { type GranolaFoldersResult } from 'src/front-components/types/granola-folders-result.type';
import { fetchGranolaFoldersOrThrow } from 'src/front-components/utils/fetch-granola-folders-or-throw.util';

export const GranolaFolderSection = () => {
  const [foldersResult, setFoldersResult] = useState<
    GranolaFoldersResult | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(true);
  // Picker key: a reload remounts it so its local selection restarts from the server's.
  const [loadCount, setLoadCount] = useState(0);

  const loadFolders = async () => {
    setIsLoading(true);

    try {
      const loadedFoldersResult = await fetchGranolaFoldersOrThrow();

      setFoldersResult(loadedFoldersResult);
      setLoadCount((current) => current + 1);
    } catch {
      setFoldersResult(undefined);
    }
    setIsLoading(false);
  };

  return (
    <Section>
      <OnMountEffect onMount={loadFolders} />
      <H2Title
        title={t('Folders')}
        description={t(
          'Choose which Granola folders feed live sync and history imports.',
        )}
      />
      <StyledSettingsSectionStack>
        {isDefined(foldersResult) && (
          <GranolaFolderPicker
            key={loadCount}
            foldersResult={foldersResult}
            onSaveError={loadFolders}
          />
        )}
        {!isDefined(foldersResult) && isLoading && (
          <GranolaFolderPolicySkeleton />
        )}
        {!isDefined(foldersResult) && !isLoading && (
          <Info
            accent="danger"
            text={t('Could not load your Granola folders.')}
            buttonTitle={t('Retry')}
            onClick={loadFolders}
          />
        )}
      </StyledSettingsSectionStack>
    </Section>
  );
};
