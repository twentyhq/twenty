import { RoundedLink } from "@/ui/navigation/link/components/RoundedLink";
import { BrowserRouter as Router } from "react-router-dom";

export const MyComponent = () => {
  const handleLinkClick = (event) => {
    console.log("Contact link clicked!", event);
  };

  return (
    <Router>
      <RoundedLink href="/contact" onClick={handleLinkClick}>
        Contact Us
      </RoundedLink>
    </Router>
  );
};
