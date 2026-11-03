import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

export type WorkspaceBrandingPreview = {
  logoUrl: string | undefined;
  displayName: string | undefined;
};

export const useWorkspaceBranding = (): WorkspaceBrandingPreview => {
  const [branding, setBranding] = useState<WorkspaceBrandingPreview>({
    logoUrl: undefined,
    displayName: undefined,
  });

  useEffect(() => {
    let isCancelled = false;

    new MetadataApiClient()
      .query({ currentWorkspace: { logo: true, displayName: true } })
      .then(({ currentWorkspace }) => {
        if (isCancelled) {
          return;
        }

        const displayName = currentWorkspace?.displayName?.trim();

        setBranding({
          logoUrl: isNonEmptyString(currentWorkspace?.logo)
            ? currentWorkspace.logo
            : undefined,
          displayName: isNonEmptyString(displayName) ? displayName : undefined,
        });
      })
      .catch(() => {});

    return () => {
      isCancelled = true;
    };
  }, []);

  return branding;
};
