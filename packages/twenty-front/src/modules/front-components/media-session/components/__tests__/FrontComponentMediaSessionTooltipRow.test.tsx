import { FrontComponentMediaSessionTooltipRow } from '@/front-components/media-session/components/FrontComponentMediaSessionTooltipRow';
import { type FrontComponentMediaSessionStatus } from '@/front-components/media-session/types/FrontComponentMediaSessionStatus';
import { render, screen } from '@testing-library/react';

describe('FrontComponentMediaSessionTooltipRow', () => {
  it.each<{
    activeMediaTypes: FrontComponentMediaSessionStatus['activeMediaTypes'];
    pendingMediaTypes: FrontComponentMediaSessionStatus['pendingMediaTypes'];
    label: string;
  }>([
    {
      activeMediaTypes: ['audio'],
      pendingMediaTypes: [],
      label: 'Microphone',
    },
    {
      activeMediaTypes: ['video'],
      pendingMediaTypes: [],
      label: 'Camera',
    },
    {
      activeMediaTypes: ['audio', 'video'],
      pendingMediaTypes: [],
      label: 'Microphone and camera',
    },
    {
      activeMediaTypes: [],
      pendingMediaTypes: ['audio', 'video'],
      label: 'Waiting for permission',
    },
  ])('displays $label', ({ activeMediaTypes, pendingMediaTypes, label }) => {
    render(
      <FrontComponentMediaSessionTooltipRow
        sessions={[
          {
            id: 'recorder-session',
            applicationId: 'recorder',
            applicationName: 'Recorder',
            activeMediaTypes,
            pendingMediaTypes,
            onStop: jest.fn(),
          },
        ]}
      />,
    );

    expect(screen.getByText(label)).toBeVisible();
  });
});
