import { msg } from '@lingui/core/macro';
import { type OnboardingInstallableApp } from '@/onboarding/types/OnboardingInstallableApp';

export const ONBOARDING_INSTALLABLE_APPS: OnboardingInstallableApp[] = [
  {
    universalIdentifier: '8da4b8b5-5edf-4880-b51f-ab6e679ec617',
    label: msg`Call recorder`,
    description: msg`Record your calls and get transcripts`,
  },
  {
    universalIdentifier: '4a1178c1-3535-4a47-b592-231d3216b36f',
    label: msg`Enrichment`,
    description: msg`Enrich your leads with People Data Labs`,
  },
  {
    universalIdentifier: '66a504cc-0a75-410e-a43f-cdeae1db1522',
    label: msg`Last contact`,
    description: msg`Get last contact date with relations`,
  },
];
