import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SettingsDataModelObjectPreview } from '@/settings/data-model/objects/components/SettingsDataModelObjectSummary';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const getMockObjectMetadataItems = (objectNameSingulars: string[]) =>
  objectNameSingulars.map(getMockObjectMetadataItemOrThrow);

describe('SettingsDataModelObjectPreview', () => {
  it('names the objects behind the other objects line in a tooltip', async () => {
    const user = userEvent.setup();

    render(
      <SettingsDataModelObjectPreview
        objectMetadataItems={getMockObjectMetadataItems([
          'company',
          'person',
          'opportunity',
          'note',
          'task',
        ])}
      />,
    );

    expect(screen.getByText('Opportunities')).toBeInTheDocument();
    expect(screen.queryByText('Notes')).not.toBeInTheDocument();

    await user.hover(screen.getByText('Other objects'));

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Notes and Tasks',
    );
  });

  it('shows every object when there are three or fewer', () => {
    render(
      <SettingsDataModelObjectPreview
        objectMetadataItems={getMockObjectMetadataItems([
          'company',
          'person',
          'opportunity',
        ])}
      />,
    );

    expect(screen.getByText('Opportunities')).toBeInTheDocument();
    expect(screen.queryByText('Other objects')).not.toBeInTheDocument();
  });
});
