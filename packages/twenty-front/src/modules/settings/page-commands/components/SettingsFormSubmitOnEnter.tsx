import { VisuallyHidden } from 'twenty-ui/primitives/accessibility';

export const SettingsFormSubmitOnEnter = () => (
  <VisuallyHidden>
    <button type="submit" tabIndex={-1} aria-hidden />
  </VisuallyHidden>
);
