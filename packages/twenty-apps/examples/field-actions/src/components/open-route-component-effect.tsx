import { useEffect } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  enqueueSnackbar,
  openUrl,
  unmountFrontComponent,
  useRecordId,
} from 'twenty-sdk/front-component';
import { CoreApiClient } from 'twenty-client-sdk/core';

const OpenRouteEffect = () => {
  const recordId = useRecordId();

  useEffect(() => {
    const openRoute = async () => {
      try {
        if (recordId === null) {
          throw new Error('Open a company to plan a route');
        }

        const { company } = await new CoreApiClient().query({
          company: {
            __args: { filter: { id: { eq: recordId } } },
            address: {
              addressStreet1: true,
              addressPostcode: true,
              addressCity: true,
              addressCountry: true,
            },
          },
        });

        const destination = [
          company?.address?.addressStreet1,
          company?.address?.addressPostcode,
          company?.address?.addressCity,
          company?.address?.addressCountry,
        ]
          .filter((part) => typeof part === 'string' && part.length > 0)
          .join(', ');

        if (destination.length === 0) {
          throw new Error('This company has no address');
        }

        await openUrl(
          `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`,
        );
      } catch (error) {
        await enqueueSnackbar({
          message:
            error instanceof Error ? error.message : 'Failed to open route',
          variant: 'error',
        });
      }

      await unmountFrontComponent();
    };

    openRoute();
  }, [recordId]);

  return null;
};

export const OPEN_ROUTE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'ad0a66e3-b23f-4066-ab1e-1e5d9a8e34d2';

export default defineFrontComponent({
  universalIdentifier: OPEN_ROUTE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Open route',
  description: 'Opens a Google Maps route to the company address',
  isHeadless: true,
  component: OpenRouteEffect,
});
