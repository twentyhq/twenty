import { RawLink } from "@/ui/navigation/link/components/RawLink";
import { BrowserRouter as Router } from "react-router-dom";

export const MyComponent = () => {
  const handleLinkClick = (event) => {
    console.log("Contact link clicked!", event);
  };

  return (
    <Router>
      <RawLink className href="/contact" onClick={handleLinkClick}>
        Contact Us
      </RawLink>
    </Router>
  );
};
