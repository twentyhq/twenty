# main.tf

# Variables
locals {
  app_env_name = "day1ai"
  location = "North Central US"

  server_name = "day1ai-server"
  server_tag  = "latest"

  front_app_name = "day1ai-front"
  front_tag      = "latest"

  db_app_name = "day1ai-postgres"
  db_tag      = "latest"

  db_user     = "twenty"
  db_password = "twenty"

  storage_mount_db_name     = "day1ai-db-storagemount"
  storage_mount_server_name = "day1ai-server-storagemount"

  cpu    = 1.0
  memory = "2Gi"

  email_address = "peter@day1ai.com"
  domain = "app.day1ai.com"

  namecheap_api_user = "day1ai"
  env_vars = { for tuple in regexall("(.*?)=(.*)", file("../.env")) : tuple[0] => tuple[1] }
}

# Create a resource group
resource "azurerm_resource_group" "main" {
  name     = "day1ai-rg"
  location = local.location
}

# Set up a Log Analytics workspace
resource "azurerm_log_analytics_workspace" "main" {
  name                = "${local.app_env_name}-law"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

# Create a storage account
resource "random_pet" "example" {
  length    = 1
  separator = ""
}
# resource "null_resource" "check_length" {
#   triggers = {
#     pet_name = random_pet.example.id
#   }

#   provisioner "local-exec" {
#     command = "if [ ${self.triggers.pet_name} -gt 16 ]; then echo 'Name too long'; exit 1; fi"
#   }
# }

resource "azurerm_storage_account" "main" {
  name                     = "day1aistorage${random_pet.example.id}"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  large_file_share_enabled = true
}

# Create db file storage
resource "azurerm_storage_share" "db" {
  name                 = "day1aiy-database-share"
  storage_account_name = azurerm_storage_account.main.name
  quota                = 50
  enabled_protocol     = "SMB"
}

# Create backend file storage
resource "azurerm_storage_share" "server" {
  name                 = "day1ai-server-share"
  storage_account_name = azurerm_storage_account.main.name
  quota                = 50
  enabled_protocol     = "SMB"
}

# Create a Container App Environment
resource "azurerm_container_app_environment" "main" {
  name                       = "${local.app_env_name}-env"
  location                   = azurerm_resource_group.main.location
  resource_group_name        = azurerm_resource_group.main.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
}

# Connect the db storage share to the container app environment
resource "azurerm_container_app_environment_storage" "db" {
  name                         = local.storage_mount_db_name
  container_app_environment_id = azurerm_container_app_environment.main.id
  account_name                 = azurerm_storage_account.main.name
  share_name                   = azurerm_storage_share.db.name
  access_key                   = azurerm_storage_account.main.primary_access_key
  access_mode                  = "ReadWrite"
}

# Connect the server storage share to the container app environment
resource "azurerm_container_app_environment_storage" "server" {
  name                         = local.storage_mount_server_name
  container_app_environment_id = azurerm_container_app_environment.main.id
  account_name                 = azurerm_storage_account.main.name
  share_name                   = azurerm_storage_share.server.name
  access_key                   = azurerm_storage_account.main.primary_access_key
  access_mode                  = "ReadWrite"
}

data "azurerm_client_config" "current" {}