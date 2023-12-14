import { BrowserRouter } from "react-router-dom";
import { Breadcrumb } from "@/ui/navigation/bread-crumb/components/Breadcrumb";

export const MyComponent = () => {
  const breadcrumbLinks = [
    { children: "Home", href: "/" },
    { children: "Category", href: "/category" },
    { children: "Subcategory", href: "/category/subcategory" },
    { children: "Current Page" },
  ];

  return (
    <BrowserRouter>
      <Breadcrumb className links={breadcrumbLinks} />
    </BrowserRouter>
    )
};
