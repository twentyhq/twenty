import { SocialLink } from "@/ui/navigation/link/components/SocialLink";
import { BrowserRouter as Router } from "react-router-dom";

export const MyComponent = () => {
  return (
    <Router>
      <SocialLink
        type="twitter"
        href="https://twitter.com/twentycrm"
      ></SocialLink>
    </Router>
  );
};
