import { IconHome, IconUser, IconSettings } from '@tabler/icons-react';
import { NavigationBar } from "@/ui/navigation/navigation-bar/components/NavigationBar";

export const MyComponent = () => {

   const navigationItems = [
     {
       name: "Home",
       Icon: IconHome,
       onClick: () => console.log("Home clicked"),
     },
     {
       name: "Profile",
       Icon: IconUser,
       onClick: () => console.log("Profile clicked"),
     },
     {
       name: "Settings",
       Icon: IconSettings,
       onClick: () => console.log("Settings clicked"),
     },
   ];

  return <NavigationBar activeItemName="Home" items={navigationItems}/>;
};
