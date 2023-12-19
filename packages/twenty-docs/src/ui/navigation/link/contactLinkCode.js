import { ContactLink } from "@/ui/navigation/link/components/ContactLink";
import { BrowserRouter as Router } from "react-router-dom";

export const MyComponent = () => {
  const handleLinkClick = (event) => {
    console.log("Contact link clicked!", event);
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
