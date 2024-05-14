# providers.tf

terraform {
  required_providers {
    azapi = {
      source = "Azure/azapi"
    }
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    acme = {
      source  = "vancluever/acme"
      version = "~> 2.0"
    }
    namecheap = {
      source = "namecheap/namecheap"
      version = ">= 2.0.0"
    }

  }
}

provider "namecheap" {
  user_name = "day1ai"
  api_user = local.namecheap_api_user
  api_key = local.env_vars["NAMECHEAP_API_KEY"]
  use_sandbox = false
}

provider "acme" {
  server_url = "https://acme-v02.api.letsencrypt.org/directory"
}

provider "azapi" {
}

provider "azurerm" {
  features {}
}

provider "azuread" {
}

provider "random" {
}

resource "random_string" "resource_code" {
  length  = 5
  special = false
  upper   = false
}

resource "azurerm_resource_group" "tfstate" {
  name     = "tfstate"
  location = "North Central US"
}

resource "azurerm_storage_account" "tfstate" {
  name                     = "tfstate${random_string.resource_code.result}"
  resource_group_name      = azurerm_resource_group.tfstate.name
  location                 = azurerm_resource_group.tfstate.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  allow_nested_items_to_be_public = false
}

resource "azurerm_storage_container" "tfstate" {
  name                  = "tfstate"
  storage_account_name  = azurerm_storage_account.tfstate.name
  container_access_type = "private"
}