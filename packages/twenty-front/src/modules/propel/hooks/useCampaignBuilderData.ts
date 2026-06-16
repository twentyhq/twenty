import { useEffect, useMemo, useState } from 'react';
import { callPropelRoute } from '@/propel/lib/callPropelRoute';
import { type CampaignBuilderHubPayload } from '@/propel/types/campaignBuilder';

// Loads the picker data the builder needs (segments, listings, WhatsApp +
// email templates, saved-snippet custom fields) from POST /s/marketing/hub —
// the same endpoint the Marketing Home hero uses, read for a different slice.
//
// Fails soft: a null route response leaves an EMPTY payload (every list []), so
// the wizard still renders honest empty states ("No saved audiences yet") and
// never throws or zero-fills.
const EMPTY: Required<
  Pick<
    CampaignBuilderHubPayload,
    'segments' | 'listings' | 'waTemplates' | 'emailTemplates' | 'customFields'
  >
> = {
  segments: [],
  listings: [],
  waTemplates: [],
  emailTemplates: [],
  customFields: [],
};

export const useCampaignBuilderData = () => {
  const [hub, setHub] = useState<CampaignBuilderHubPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    void callPropelRoute<CampaignBuilderHubPayload>('/marketing/hub', {}).then(
      (payload) => {
        if (!active) return;
        setHub(payload);
        setIsLoading(false);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const data = useMemo(
    () => ({
      segments: hub?.segments ?? EMPTY.segments,
      listings: hub?.listings ?? EMPTY.listings,
      waTemplates: hub?.waTemplates ?? EMPTY.waTemplates,
      emailTemplates: hub?.emailTemplates ?? EMPTY.emailTemplates,
      customFields: hub?.customFields ?? EMPTY.customFields,
    }),
    [hub],
  );

  return { ...data, isLoading };
};
