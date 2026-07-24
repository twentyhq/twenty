import { defineFrontComponent } from 'twenty-sdk/define';
import {
  AppTooltip,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalFooter,
  ModalHeader,
  OverflowingTextWithTooltip,
} from 'twenty-ui/surfaces';
import { ThemeProvider } from 'twenty-ui/theme-constants';

import {
  ComponentGallery,
  type GalleryEntry,
} from '../shared/front-components/component-gallery';

const SURFACES_ENTRIES: GalleryEntry[] = [
  {
    name: 'AppTooltip',
    node: (
      <>
        <span id="gallery-tooltip-anchor">Tooltip anchor</span>
        <AppTooltip
          anchorSelect="#gallery-tooltip-anchor"
          content="Tooltip content"
          isOpen={true}
        />
      </>
    ),
  },
  {
    name: 'Card',
    node: <Card>Card body</Card>,
  },
  {
    name: 'CardContent',
    node: <CardContent>Card content</CardContent>,
  },
  {
    name: 'CardFooter',
    node: <CardFooter>Card footer</CardFooter>,
  },
  {
    name: 'CardHeader',
    node: <CardHeader>Card header</CardHeader>,
  },
  // Rendered closed here so a hang cannot mask the rest of this gallery; the
  // open-Modal known issue is exposed by twenty-ui-modal-open-gallery.
  {
    name: 'Modal',
    node: (
      <Modal isOpen={false} ariaLabel="Gallery modal">
        Modal body
      </Modal>
    ),
  },
  {
    name: 'ModalBackdrop',
    node: (
      <ModalBackdrop overlay="dark" backdropZIndex={39}>
        Backdrop child
      </ModalBackdrop>
    ),
  },
  {
    name: 'ModalContent',
    node: <ModalContent>Modal content</ModalContent>,
  },
  {
    name: 'ModalFooter',
    node: <ModalFooter>Modal footer</ModalFooter>,
  },
  {
    name: 'ModalHeader',
    node: <ModalHeader>Modal header</ModalHeader>,
  },
  {
    name: 'OverflowingTextWithTooltip',
    node: <OverflowingTextWithTooltip text="Some overflowing text" />,
  },
];

const SurfacesGallery = () => (
  <ThemeProvider colorScheme="light">
    <ComponentGallery title="twenty-ui/surfaces" entries={SURFACES_ENTRIES} />
  </ThemeProvider>
);

export default defineFrontComponent({
  universalIdentifier: 'test-20ui0-0000-0000-0000-000000000105',
  name: 'twenty-ui-surfaces-gallery',
  description: 'Renders every twenty-ui/surfaces component in the sandbox',
  component: SurfacesGallery,
});
