import { OnboardingTitle } from './OnboardingTitle';
import { OnboardingSubtitle } from './OnboardingSubtitle';

type SetupHeadingProps = {
  title: string;
  continuation?: string;
  description?: string;
};

export const SetupHeading = ({
  title,
  continuation,
  description,
}: SetupHeadingProps) => (
  <header className="setup-heading">
    <OnboardingTitle>
      {continuation ? (
        <>
          <span>{title}</span> <span>{continuation}</span>
        </>
      ) : (
        title
      )}
    </OnboardingTitle>
    {description != null && (
      <OnboardingSubtitle>{description}</OnboardingSubtitle>
    )}
  </header>
);
