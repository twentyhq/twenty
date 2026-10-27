import { VisuallyHidden } from 'twenty-ui/primitives/accessibility';

type SettingsFormSubmitOnEnterProps = {
  disabled?: boolean;
};

export const SettingsFormSubmitOnEnter = ({
  disabled,
}: SettingsFormSubmitOnEnterProps) => (
  <VisuallyHidden>
    <button type="submit" tabIndex={-1} aria-hidden disabled={disabled} />
  </VisuallyHidden>
);
