import { defineFrontComponent } from 'twenty-sdk/define';
import {
  IconAddressBook,
  IconBrandAnthropic,
  IconBrandGemini,
  IconBrandGroq,
  IconBrandMistral,
  IconBrandXai,
  IconCalendar,
  IconChartBarHorizontal,
  IconCheck,
  IconChevronDown,
  IconGmail,
  IconGoogle,
  IconGoogleCalendar,
  IconHeart,
  IconLink,
  IconLockCustom,
  IconMail,
  IconMicrosoft,
  IconMicrosoftCalendar,
  IconMicrosoftOutlook,
  IconModelClaude,
  IconPhone,
  IconPlus,
  IconProviderOpenai,
  IconRelationManyToOne,
  IconSearch,
  IconSettings,
  IconSparkle2,
  IconStar,
  IconTrash,
  IconTrashXOff,
  IconTwentyStar,
  IconTwentyStarFilled,
  IconUser,
  IconX,
  IllustrationIconArray,
  IllustrationIconCalendarEvent,
  IllustrationIconCalendarTime,
  IllustrationIconCurrency,
  IllustrationIconFile,
  IllustrationIconJson,
  IllustrationIconLink,
  IllustrationIconMail,
  IllustrationIconManyToMany,
  IllustrationIconMap,
  IllustrationIconNumbers,
  IllustrationIconOneToMany,
  IllustrationIconOneToOne,
  IllustrationIconPhone,
  IllustrationIconSetting,
  IllustrationIconStar,
  IllustrationIconTag,
  IllustrationIconTags,
  IllustrationIconText,
  IllustrationIconToggle,
  IllustrationIconUid,
  IllustrationIconUser,
  IllustrationIconWrapper,
  ThinkingOrbitLoaderIcon,
  type IconComponent,
} from 'twenty-ui/icon';
import { ThemeProvider } from 'twenty-ui/theme-constants';

import {
  ComponentGallery,
  type GalleryEntry,
} from '../shared/front-components/component-gallery';

const CUSTOM_ICONS: Record<string, IconComponent> = {
  IconAddressBook,
  IconBrandAnthropic,
  IconBrandGemini,
  IconBrandGroq,
  IconBrandMistral,
  IconBrandXai,
  IconChartBarHorizontal,
  IconGmail,
  IconGoogle,
  IconGoogleCalendar,
  IconLockCustom,
  IconMicrosoft,
  IconMicrosoftCalendar,
  IconMicrosoftOutlook,
  IconModelClaude,
  IconProviderOpenai,
  IconRelationManyToOne,
  IconSparkle2,
  IconTrashXOff,
  IconTwentyStar,
  IconTwentyStarFilled,
};

const ILLUSTRATION_ICONS: Record<string, IconComponent> = {
  IllustrationIconArray,
  IllustrationIconCalendarEvent,
  IllustrationIconCalendarTime,
  IllustrationIconCurrency,
  IllustrationIconFile,
  IllustrationIconJson,
  IllustrationIconLink,
  IllustrationIconMail,
  IllustrationIconManyToMany,
  IllustrationIconMap,
  IllustrationIconNumbers,
  IllustrationIconOneToMany,
  IllustrationIconOneToOne,
  IllustrationIconPhone,
  IllustrationIconSetting,
  IllustrationIconStar,
  IllustrationIconTag,
  IllustrationIconTags,
  IllustrationIconText,
  IllustrationIconToggle,
  IllustrationIconUid,
  IllustrationIconUser,
};

// Representative sample of the ~400 re-exported Tabler icons: they all share
// the same implementation, so rendering each one would only slow the suite.
const TABLER_ICON_SAMPLE: Record<string, IconComponent> = {
  IconCalendar,
  IconCheck,
  IconChevronDown,
  IconHeart,
  IconLink,
  IconMail,
  IconPhone,
  IconPlus,
  IconSearch,
  IconSettings,
  IconStar,
  IconTrash,
  IconUser,
  IconX,
};

const iconEntries = (icons: Record<string, IconComponent>): GalleryEntry[] =>
  Object.entries(icons).map(([name, IconComponentToRender]) => ({
    name,
    node: <IconComponentToRender size={20} />,
  }));

const ICON_ENTRIES: GalleryEntry[] = [
  ...iconEntries(CUSTOM_ICONS),
  ...iconEntries(ILLUSTRATION_ICONS),
  ...iconEntries(TABLER_ICON_SAMPLE),
  {
    name: 'IllustrationIconWrapper',
    node: <IllustrationIconWrapper>i</IllustrationIconWrapper>,
  },
  {
    name: 'ThinkingOrbitLoaderIcon',
    node: <ThinkingOrbitLoaderIcon size={16} />,
  },
];

const IconGallery = () => (
  <ThemeProvider colorScheme="light">
    <ComponentGallery title="twenty-ui/icon" entries={ICON_ENTRIES} />
  </ThemeProvider>
);

export default defineFrontComponent({
  universalIdentifier: 'test-20ui0-0000-0000-0000-000000000109',
  name: 'twenty-ui-icon-gallery',
  description:
    'Renders twenty-ui custom and illustration icons plus a Tabler sample in the sandbox',
  component: IconGallery,
});
