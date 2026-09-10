import { defineFrontComponent } from 'twenty-sdk/define';
import { IconPlus, IconSearch, IconStar, IconTrash } from 'twenty-ui/icon';
import {
  AdvancedSettingsToggle,
  AnimatedButton,
  AnimatedLightIconButton,
  Button,
  ButtonGroup,
  CardPicker,
  Checkbox,
  ColorPickerButton,
  ColorSchemeCard,
  ColorSchemePicker,
  CoreEditorHeader,
  FloatingButton,
  FloatingButtonGroup,
  FloatingIconButton,
  FloatingIconButtonGroup,
  IconButton,
  IconButtonGroup,
  IconListViewGrip,
  InsideButton,
  LightButton,
  LightIconButton,
  LightIconButtonGroup,
  MainButton,
  Radio,
  RadioGroup,
  RoundedIconButton,
  SearchInput,
  SegmentedControl,
  Slider,
  StyledTabContainer,
  TabButton,
  TabContent,
  Toggle,
} from 'twenty-ui/input';
import { ThemeProvider } from 'twenty-ui/theme-constants';

import {
  ComponentGallery,
  type GalleryEntry,
} from '../shared/front-components/component-gallery';

const INPUT_ENTRIES: GalleryEntry[] = [
  {
    name: 'AdvancedSettingsToggle',
    node: (
      <AdvancedSettingsToggle
        isAdvancedModeEnabled={false}
        setIsAdvancedModeEnabled={() => {}}
      />
    ),
  },
  {
    name: 'AnimatedButton',
    node: (
      <AnimatedButton
        title="Animated"
        animatedSvg={<svg width={16} height={16} />}
      />
    ),
  },
  {
    name: 'AnimatedLightIconButton',
    node: <AnimatedLightIconButton Icon={IconStar} />,
  },
  {
    name: 'Button',
    node: <Button title="Button" onClick={() => {}} />,
  },
  {
    name: 'ButtonGroup',
    node: (
      <ButtonGroup>
        {[<Button key="a" title="A" />, <Button key="b" title="B" />]}
      </ButtonGroup>
    ),
  },
  {
    name: 'CardPicker',
    node: (
      <CardPicker checked={false} handleChange={() => {}}>
        Card
      </CardPicker>
    ),
  },
  {
    name: 'Checkbox',
    node: <Checkbox checked={false} onChange={() => {}} />,
  },
  {
    name: 'CoreEditorHeader',
    node: <CoreEditorHeader title="Editor" />,
  },
  {
    name: 'ColorPickerButton',
    node: <ColorPickerButton colorName="blue" onClick={() => {}} />,
  },
  {
    name: 'ColorSchemeCard',
    node: <ColorSchemeCard variant="Light" />,
  },
  {
    name: 'ColorSchemePicker',
    node: (
      <ColorSchemePicker
        value="Light"
        onChange={() => {}}
        lightLabel="Light"
        darkLabel="Dark"
        systemLabel="System"
      />
    ),
  },
  {
    name: 'FloatingButton',
    node: <FloatingButton title="Floating" />,
  },
  {
    name: 'FloatingButtonGroup',
    node: (
      <FloatingButtonGroup>
        {[
          <FloatingButton key="a" title="A" />,
          <FloatingButton key="b" title="B" />,
        ]}
      </FloatingButtonGroup>
    ),
  },
  {
    name: 'FloatingIconButton',
    node: <FloatingIconButton Icon={IconSearch} ariaLabel="Search" />,
  },
  {
    name: 'FloatingIconButtonGroup',
    node: (
      <FloatingIconButtonGroup
        iconButtons={[{ Icon: IconSearch, ariaLabel: 'Search' }]}
      />
    ),
  },
  {
    name: 'IconButton',
    node: <IconButton Icon={IconPlus} ariaLabel="Add" onClick={() => {}} />,
  },
  {
    name: 'IconButtonGroup',
    node: (
      <IconButtonGroup
        iconButtons={[{ Icon: IconTrash, ariaLabel: 'Delete' }]}
      />
    ),
  },
  {
    name: 'IconListViewGrip',
    node: <IconListViewGrip />,
  },
  {
    name: 'InsideButton',
    node: <InsideButton Icon={IconPlus} ariaLabel="Add" />,
  },
  {
    name: 'LightButton',
    node: <LightButton title="Light" />,
  },
  {
    name: 'LightIconButton',
    node: <LightIconButton Icon={IconStar} aria-label="Star" />,
  },
  {
    name: 'LightIconButtonGroup',
    node: (
      <LightIconButtonGroup
        iconButtons={[{ Icon: IconStar, ariaLabel: 'Star', onClick: () => {} }]}
      />
    ),
  },
  {
    name: 'MainButton',
    node: <MainButton title="Main" />,
  },
  {
    name: 'Radio',
    node: <Radio checked={false} label="Radio" />,
  },
  {
    name: 'RadioGroup',
    node: (
      <RadioGroup value="a">
        <Radio value="a" label="A" />
        <Radio value="b" label="B" />
      </RadioGroup>
    ),
  },
  {
    name: 'RoundedIconButton',
    node: <RoundedIconButton Icon={IconPlus} aria-label="Add" />,
  },
  {
    name: 'SearchInput',
    node: <SearchInput value="" onChange={() => {}} placeholder="Search" />,
  },
  {
    name: 'SegmentedControl',
    node: (
      <SegmentedControl
        ariaLabel="Choose"
        value="left"
        onChange={() => {}}
        options={[
          { value: 'left', label: 'Left' },
          { value: 'right', label: 'Right' },
        ]}
      />
    ),
  },
  {
    name: 'Slider',
    node: <Slider max={100} value={50} onChange={() => {}} />,
  },
  {
    name: 'StyledTabContainer',
    node: (
      <StyledTabContainer>
        <TabButton id="t1" title="Tab" />
      </StyledTabContainer>
    ),
  },
  {
    name: 'TabButton',
    node: <TabButton id="tab1" title="Tab" />,
  },
  {
    name: 'TabContent',
    node: <TabContent id="tc1" title="Content" />,
  },
  {
    name: 'Toggle',
    node: <Toggle value={false} onChange={() => {}} />,
  },
];

const InputGallery = () => (
  <ThemeProvider colorScheme="light">
    <ComponentGallery title="twenty-ui/input" entries={INPUT_ENTRIES} />
  </ThemeProvider>
);

export default defineFrontComponent({
  universalIdentifier: 'test-20ui0-0000-0000-0000-000000000107',
  name: 'twenty-ui-input-gallery',
  description:
    'Renders every twenty-ui/input component (except monaco CodeEditor) in the sandbox',
  component: InputGallery,
});
