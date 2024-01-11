import { BrowserRouter as Router } from 'react-router-dom';

import { ContactLink } from '@/ui/navigation/link/components/ContactLink';

export const MyComponent = () => {
  const handleLinkClick = (event) => {
    console.log('Contact link clicked!', event);
  };

  return (
    <Router>
      <ContactLink
        className
        href="mailto:example@example.com"
        onClick={handleLinkClick}
      >
        example@example.com
      </ContactLink>
    </Router>
  );
};
