import { defineFrontComponent } from 'twenty-sdk/define';
import 'twenty-ui/style.css';
import {
  EllipsisDisplay,
  JsonDisplay,
  NumberDisplay,
  SelectDisplay,
  TextDisplay,
} from 'twenty-ui/data-display';
import { ThemeProvider } from 'twenty-ui/theme-constants';
import { Text } from 'twenty-ui/typography';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';

const DisplayHelpers = () => (
  <ThemeProvider colorScheme="light">
    <FrontComponentCard title="Text and display helpers">
      <Text render={<p />} truncate style={{ width: 160 }}>
        A long account name that should truncate
      </Text>
      <Text lineClamp={2} style={{ width: 160 }}>
        A longer account description that spans several lines and should be
        clamped to two lines.
      </Text>
      <EllipsisDisplay maxWidth={120}>
        An overflowing reference number
      </EllipsisDisplay>
      <NumberDisplay value={1234.5} />
      <JsonDisplay text={'{"active":true}'} />
      <TextDisplay text="Account description" />
      <SelectDisplay color="green" label="Qualified" />
    </FrontComponentCard>
  </ThemeProvider>
);

export default defineFrontComponent({
  universalIdentifier: '4d23e9af-7cb3-4e4a-bbca-8e960f840002',
  name: 'twenty-ui-display-helpers',
  description: 'Text and migrated display helpers in the sandbox',
  component: DisplayHelpers,
});
